
from playwright.sync_api import sync_playwright
import os

def run():
    # Because this is a static site with no dev server for the root needed (just files),
    # we can try to open the index.html file directly using the file protocol.
    # However, relative links in file:// protocol might behave differently than http://
    # So we'll start a simple http server for the verification.

    from http.server import HTTPServer, SimpleHTTPRequestHandler
    import threading

    server_address = ('', 8000)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the root index.html
        page.goto('http://localhost:8000/index.html')

        # Find the blog link
        blog_link = page.locator('a.btn[href="blog/dist/index.html"]')

        # Check if it exists and is visible
        if blog_link.is_visible():
            print('Blog link found and visible')
        else:
            print('Blog link not found or not visible')
            exit(1)

        # Click the link
        blog_link.click()

        # Wait for navigation
        page.wait_for_load_state('networkidle')

        # Check if we are on the blog page (it should have 'blog' in title or some content)
        # The blog/index.html has title 'blog'
        print(f'Page title: {page.title()}')

        if 'blog' in page.title().lower():
             print('Successfully navigated to blog')
        else:
             print('Failed to navigate to blog')

        # Take a screenshot
        page.screenshot(path='verification/blog_verification.png')

        browser.close()
        httpd.shutdown()

if __name__ == '__main__':
    run()
