from playwright.sync_api import sync_playwright
import os

def check_url():
    with sync_playwright() as p:
        # Just checking the file content statically might be easier,
        # but let's use playwright to ensure no JS syntax errors were introduced.
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        filepath = f"file://{cwd}/Portfolio/Sketches.html"
        page.goto(filepath)

        # We want to check if the API_URL variable is set correctly.
        # We can evaluate JS.
        api_url = page.evaluate("API_URL")
        print(f"API_URL in browser: {api_url}")

        if api_url == 'http://localhost:3001/api/gallery/Sketches':
            print("Verification Success: API_URL matches 'Sketches'")
        else:
            print(f"Verification Failed: API_URL is '{api_url}'")

        browser.close()

if __name__ == "__main__":
    check_url()
