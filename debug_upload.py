from playwright.sync_api import sync_playwright
import time

def debug_upload():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Monitor console logs
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        
        page.goto('http://localhost:3000/admin/login')
        page.fill('input[name="username"]', 'admin')
        page.fill('input[name="password"]', 'admin')
        page.click('button[type="submit"]')
        page.wait_for_url('http://localhost:3000/admin')
        
        # Now navigate to fabrics
        page.goto('http://localhost:3000/admin/fabrics')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='page_after_login.png')
        
        # Create a dummy image
        with open('test_image.png', 'wb') as f:
            f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
            
        # Locate file input and upload
        page.set_input_files('input[type="file"]', 'test_image.png')
        
        # Listen for the upload API response
        def handle_response(response):
            if '/api/admin/upload' in response.url:
                print(f"API Response URL: {response.url}")
                print(f"API Response Status: {response.status}")
                print(f"API Response Body: {response.text()}")

        page.on("response", handle_response)
        
        # Wait a bit for the upload to process
        page.wait_for_timeout(5000)
        
        browser.close()

if __name__ == '__main__':
    debug_upload()
