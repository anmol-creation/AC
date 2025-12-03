
from playwright.sync_api import sync_playwright
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

def run():
    server_address = ('', 8001)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the root index.html
        page.goto('http://localhost:8001/index.html')

        # Click the link
        page.click('a.btn[href="blog/dist/index.html"]')

        # Wait for navigation
        page.wait_for_load_state('networkidle')

        # Check for content that should be on the blog home page.
        # I'll check for something that is likely on the home page.
        # Based on src/pages/Home.jsx (I haven't read it but let's assume it has some text)
        # Or I can just dump the text content to see if it's not empty/blank.

        content = page.content()
        text_content = page.inner_text('body')

        print(f'Page title: {page.title()}')
        print(f'Body text length: {len(text_content)}')

        # If the body text is very short, it might be blank.
        if len(text_content) < 50:
             print('WARNING: Page seems empty.')
        else:
             print('Page has content.')
             print(f'Snippet: {text_content[:200]}')

        # Take a screenshot
        page.screenshot(path='verification/blog_verification_fixed.png')

        browser.close()
        httpd.shutdown()

if __name__ == '__main__':
    run()
