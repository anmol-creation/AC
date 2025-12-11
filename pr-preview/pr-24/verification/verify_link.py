from playwright.sync_api import sync_playwright
import os

def check_link():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Open Portfolio.html
        cwd = os.getcwd()
        filepath = f"file://{cwd}/Portfolio/Portfolio.html"
        print(f"Opening {filepath}")

        page.goto(filepath)

        # Check the Sketches link href
        # We look for the link specifically
        sketches_link = page.locator("a[href='Sketches.html']")
        count = sketches_link.count()
        print(f"Found {count} link(s) to Sketches.html")

        if count > 0:
            print("Link fix verified: href is correctly pointing to Sketches.html")
        else:
            print("Link fix failed: Could not find link with href='Sketches.html'")
            links = page.locator("a").all()
            for link in links:
                print(f"Link href: {link.get_attribute('href')}")

        page.screenshot(path="verification/portfolio_link.png")
        browser.close()

if __name__ == "__main__":
    check_link()
