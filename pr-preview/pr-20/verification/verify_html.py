from playwright.sync_api import Page, expect, sync_playwright

def verify_html_rendering(page: Page):
    print("Navigating to home...")
    page.goto("http://localhost:5173/")

    print("Waiting for 'HTML Rendering Test' link...")
    # Increase timeout to 30s just in case
    link = page.get_by_role("link", name="HTML Rendering Test").first
    expect(link).to_be_visible(timeout=30000)

    print("Clicking link...")
    link.click()

    print("Waiting for post content...")
    # Wait for the H1 to appear
    expect(page.get_by_role("heading", name="Standard Markdown Heading")).to_be_visible()

    print("Verifying HTML elements...")
    # HTML Heading
    html_heading = page.get_by_text("This is an HTML Heading with Styles")
    expect(html_heading).to_be_visible()

    # HTML Button
    html_button = page.get_by_role("button", name="HTML Button")
    expect(html_button).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="verification/html_rendering.png")
    print("Success!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_html_rendering(page)
        except Exception as e:
            print(f"Test failed: {e}")
            try:
                page.screenshot(path="verification/error.png")
            except:
                pass
            raise
        finally:
            browser.close()
