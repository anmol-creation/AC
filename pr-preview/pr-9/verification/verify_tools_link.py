from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Absolute path to the index.html
        repo_root = os.path.abspath(".")
        index_path = f"file://{repo_root}/index.html"

        print(f"Navigating to {index_path}")
        page.goto(index_path)

        # Check if the Tools link exists and has the correct href
        tools_link = page.locator("a.btn", has_text="Tools")
        expect(tools_link).to_be_visible()

        # Verify href attribute
        # Note: when using file://, relative links are resolved.
        # But we can check the attribute value directly.
        href = tools_link.get_attribute("href")
        print(f"Tools link href: {href}")

        if href != "image-compressor/index.html":
             print(f"Warning: Expected 'image-compressor/index.html', got '{href}'")

        # Click the link
        tools_link.click()

        # Wait for navigation
        page.wait_for_load_state("networkidle")

        # Verify we are on the image compressor page
        # The title should be "Image Compressor & Resizer"
        print(f"Current title: {page.title()}")
        expect(page).to_have_title("Image Compressor & Resizer")

        # Take a screenshot
        screenshot_path = "verification/tools_link_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
