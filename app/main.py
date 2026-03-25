The 404 Not Found error from the GitHub API when attempting to retrieve a workflow run (`GET /repos/{owner}/{repo}/actions/runs/{run_id}`) is almost always due to incorrect identifiers or access issues.

Here, we'll provide **corrected Python code** using the `requests` library. This code will demonstrate:
1.  **Robust retrieval:** How to correctly make the API call.
2.  **Error Handling:** How to gracefully handle 404s and other API errors, providing more informative messages.
3.  **Verification Helper:** A function to list workflow runs, which is crucial for verifying `run_id`s, `owner`s, and `repo`s.
4.  **Best Practices:** Using environment variables for sensitive information like tokens.

---

### Before Correction (Illustrative Example of how a 404 might occur)

Imagine you had some code like this, where `run_id`, `repo`, or `owner` might be hardcoded or passed incorrectly, and error handling is minimal:

```python
import requests
import os

def get_workflow_run_bad_example(owner, repo, run_id):
    # This token might be hardcoded, expired, or have insufficient scopes
    github_token = os.getenv("GITHUB_TOKEN_BAD", "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") 
    
    url = f"https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {github_token}"
    }

    response = requests.get(url, headers=headers)
    
    # Minimal error checking, might just raise an unhandled exception or return cryptic status
    response.raise_for_status() 
    return response.json()

# Example usage with potentially incorrect data
# run_data = get_workflow_run_bad_example("myorg", "non-existent-repo", "1234567890")
# print(run_data) 
# This would likely throw a requests.exceptions.HTTPError for 404 or 403.
```

---

### Corrected Code and Best Practices

This corrected code focuses on robust parameter handling, clear authentication, and comprehensive error logging to help pinpoint the exact root cause of a 404.

```python
import requests
import os
import json

# --- Configuration (Best Practice: Use Environment Variables) ---
# Ensure these environment variables are set before running the script:
# export GITHUB_TOKEN="ghp_YOUR_PERSONAL_ACCESS_TOKEN" 
# export GITHUB_ORG="your_github_organization_or_username"
# export GITHUB_REPO="your_repository_name"

class GitHubAPIError(Exception):
    """Custom exception for GitHub API errors."""
    pass

def _make_github_api_request(method, url, github_token, params=None):
    """
    Helper function to make authenticated GitHub API requests.
    Handles common errors and returns JSON response or raises GitHubAPIError.
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {github_token}",
    }
    
    try:
        response = requests.request(method, url, headers=headers, params=params)
        response.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        error_message = e.response.json().get('message', 'No specific error message from API.')
        documentation_url = e.response.json().get('documentation_url', 'No documentation URL provided.')
        
        if status_code == 404:
            raise GitHubAPIError(
                f"Error 404: Resource not found. This could be due to:\n"
                f"  - Incorrect owner/repo/run_id.\n"
                f"  - The resource being private and your token lacking access.\n"
                f"  - The resource being deleted or non-existent.\n"
                f"API Message: '{error_message}' (Documentation: {documentation_url})\n"
                f"Requested URL: {url}"
            ) from e
        elif status_code == 403:
            raise GitHubAPIError(
                f"Error 403: Forbidden. Your GitHub token likely has insufficient permissions or is expired/invalid.\n"
                f"  - Required scopes often include 'repo' for private repos or 'public_repo' for public ones.\n"
                f"API Message: '{error_message}' (Documentation: {documentation_url})\n"
                f"Requested URL: {url}"
            ) from e
        elif status_code == 401:
            raise GitHubAPIError(
                f"Error 401: Unauthorized. Your GitHub token is invalid or missing.\n"
                f"API Message: '{error_message}' (Documentation: {documentation_url})\n"
                f"Requested URL: {url}"
            ) from e
        else:
            raise GitHubAPIError(
                f"GitHub API Error {status_code}: {error_message}\n"
                f"Requested URL: {url}"
            ) from e
    except requests.exceptions.RequestException as e:
        raise GitHubAPIError(f"Network or connection error during API request: {e}") from e


def get_workflow_run(owner, repo, run_id, github_token):
    """
    Retrieves a specific GitHub Actions workflow run.

    Addresses Root Causes:
    - Ensures correct URL construction.
    - Uses provided `github_token` for authentication.
    - Provides specific error messages for 404, 403, 401 to help diagnose
      `run_id` correctness, `owner`/`repo` typos, and permission issues.
    """
    if not all([owner, repo, run_id, github_token]):
        raise ValueError("owner, repo, run_id, and github_token cannot be empty.")

    url = f"https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}"
    print(f"Attempting to retrieve workflow run: {url}")
    return _make_github_api_request("GET", url, github_token)

def list_workflow_runs(owner, repo, github_token, max_runs=10):
    """
    Lists recent GitHub Actions workflow runs for a repository.
    Useful for verifying 'owner', 'repo', and obtaining valid 'run_id's.

    Addresses Root Causes:
    - Helps confirm if `owner` and `repo` are correct and accessible.
    - Provides a list of valid `run_id`s to use with `get_workflow_run`.
    """
    if not all([owner, repo, github_token]):
        raise ValueError("owner, repo, and github_token cannot be empty.")

    url = f"https://api.github.com/repos/{owner}/{repo}/actions/runs"
    params = {"per_page": max_runs} # Get a few recent runs
    print(f"Attempting to list workflow runs: {url}")
    response_data = _make_github_api_request("GET", url, github_token, params=params)
    
    if response_data and 'workflow_runs' in response_data:
        runs_info = []
        for run in response_data['workflow_runs']:
            runs_info.append({
                "id": run['id'],
                "name": run.get('name', 'N/A'),
                "workflow_id": run['workflow_id'],
                "status": run['status'],
                "conclusion": run['conclusion'],
                "created_at": run['created_at'],
                "html_url": run['html_url']
            })
        return runs_info
    return []

# --- Example Usage ---
if __name__ == "__main__":
    # Load configuration from environment variables
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_ORG = os.getenv("GITHUB_ORG")
    GITHUB_REPO = os.getenv("GITHUB_REPO")

    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN environment variable not set.")
        print("Please set it to your GitHub Personal Access Token.")
        exit(1)
    if not GITHUB_ORG or not GITHUB_REPO:
        print("Error: GITHUB_ORG and GITHUB_REPO environment variables not set.")
        print("Please set them to your GitHub organization/username and repository name.")
        exit(1)

    print(f"\n--- Listing Workflow Runs for {GITHUB_ORG}/{GITHUB_REPO} ---")
    valid_run_id = None
    try:
        runs = list_workflow_runs(GITHUB_ORG, GITHUB_REPO, GITHUB_TOKEN, max_runs=5)
        if runs:
            print(f"Successfully listed {len(runs)} recent workflow runs:")
            for i, run in enumerate(runs):
                print(f"  {i+1}. Run ID: {run['id']}, Name: '{run['name']}', Status: {run['status']}, URL: {run['html_url']}")
            valid_run_id = runs[0]['id'] # Take the first run_id for testing
        else:
            print(f"No workflow runs found for {GITHUB_ORG}/{GITHUB_REPO}. Is the repository correct and accessible?")
    except GitHubAPIError as e:
        print(f"Failed to list workflow runs: {e}")
    except ValueError as e:
        print(f"Configuration error: {e}")


    if valid_run_id:
        print(f"\n--- Attempting to retrieve a VALID workflow run (ID: {valid_run_id}) ---")
        try:
            workflow_run_data = get_workflow_run(GITHUB_ORG, GITHUB_REPO, valid_run_id, GITHUB_TOKEN)
            print("Successfully retrieved workflow run data (snippet):")
            print(json.dumps(workflow_run_data, indent=2)[:500] + "...") # Print a snippet
        except GitHubAPIError as e:
            print(f"Failed to retrieve workflow run: {e}")
        except ValueError as e:
            print(f"Configuration error: {e}")

        print(f"\n--- Attempting to retrieve an INVALID workflow run (ID: 99999999999) ---")
        try:
            # Simulate an incorrect run_id (Root Cause 1)
            get_workflow_run(GITHUB_ORG, GITHUB_REPO, 99999999999, GITHUB_TOKEN)
        except GitHubAPIError as e:
            print(f"Caught expected error for invalid run_id:\n{e}")
        except ValueError as e:
            print(f"Configuration error: {e}")
            
    print(f"\n--- Attempting to retrieve from a NON-EXISTENT REPO ({GITHUB_ORG}/non-existent-repo) ---")
    try:
        # Simulate incorrect owner/repo (Root Cause 2)
        get_workflow_run(GITHUB_ORG, "non-existent-repo", 1234567890, GITHUB_TOKEN)
    except GitHubAPIError as e:
        print(f"Caught expected error for non-existent repo:\n{e}")
    except ValueError as e:
        print(f"Configuration error: {e}")

    # You can also simulate a bad token by setting GITHUB_TOKEN to an invalid value
    # or by trying to access a private repo without sufficient scopes.
    # The _make_github_api_request function's error handling will differentiate 401/403.
```

---

### How this Corrected Code Addresses the Root Causes:

1.  **Incorrect `run_id`:**
    *   The `list_workflow_runs` function allows you to programmatically fetch valid `run_id`s, mitigating errors from typos or using non-existent IDs.
    *   The `get_workflow_run` function, with its detailed 404 error message, will clearly indicate that the *resource* (the run) was not found, prompting you to verify the `run_id` against the list.

2.  **Incorrect `owner` or `repo`:**
    *   Both `list_workflow_runs` and `get_workflow_run` take `owner` and `repo` as parameters. If these are incorrect, the `_make_github_api_request` helper will return a 404 error with a message indicating the resource was not found. The error output clearly shows the URL, making it easy to spot a typo in the `owner` or `repo` segment.

3.  **Permissions Issue (Disguised 404), Invalid/Expired Token, Insufficient Scope:**
    *   The `_make_github_api_request` function includes specific error handling for `401 Unauthorized` and `403 Forbidden` status codes. While GitHub *can* return a 404 for permission issues (especially for private resources you have no access to), this detailed error handling helps differentiate.
        *   A `401` explicitly points to an invalid/expired token.
        *   A `403` suggests insufficient scopes for the token or lack of access to the resource.
        *   A `404` where the `owner`/`repo`/`run_id` appear correct usually implies the resource truly doesn't exist for *any* user, or it's a very strict permission failure disguised as 404. The verbose error message for 404 still includes the token-related advice.
    *   It emphasizes loading the `GITHUB_TOKEN` from environment variables, promoting secure and easily manageable authentication.

4.  **Resource Deletion/Archiving:**
    *   If the repository or workflow run was deleted/archived, the API would correctly return a `404 Not Found`. The robust error handling will catch this and report it clearly, pointing to the specific URL that failed. The `list_workflow_runs` function would also fail (or return an empty list) for a deleted repository, providing an initial diagnostic step.

By using this corrected code, you gain better insights into why a 404 is occurring, making it much easier to pinpoint and fix the root cause.