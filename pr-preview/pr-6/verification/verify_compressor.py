from playwright.sync_api import Page, expect, sync_playwright
import os

def test_compressor_ui(page: Page):
    # Get the absolute path to the index.html file
    cwd = os.getcwd()
    file_path = f"file://{cwd}/image-compressor/index.html"

    # 1. Arrange: Go to the tool page
    page.goto(file_path)

    # 2. Assert: Check for key elements
    expect(page.locator(".app-title")).to_contain_text("Image Studio")
    expect(page.locator("#drop-zone")).to_be_visible()
    expect(page.locator("#quality-slider")).to_be_visible()
    expect(page.locator("#process-btn")).to_be_visible()

    # Check that settings panel is visible
    expect(page.locator(".controls-panel")).to_be_visible()

    # Check that preview panel is visible
    expect(page.locator(".preview-panel")).to_be_visible()

    # 3. Screenshot: Capture the UI
    page.screenshot(path="verification/compressor_ui.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_compressor_ui(page)
        finally:
            browser.close()
