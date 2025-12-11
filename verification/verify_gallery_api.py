import requests
import time
import subprocess
import os
import signal

def test_gallery_api():
    # Start the server in the background
    # We need to be in the blog directory
    env = os.environ.copy()
    # Mock Cloudinary keys to avoid "missing keys" warning (though the code handles it)
    # Actually, let's verify the mock response first.

    proc = subprocess.Popen(["node", "blog/server/index.cjs"], env=env)

    try:
        time.sleep(3) # Wait for server to start

        # Test case 1: Lowercase 'sketches' (Standard)
        print("Testing /api/gallery/sketches...")
        try:
            r = requests.get("http://localhost:3001/api/gallery/sketches")
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                print("Response OK")
            else:
                print(f"Failed: {r.text}")
        except Exception as e:
            print(f"Request failed: {e}")

        # Test case 2: Title case 'Sketches' (User scenario)
        print("\nTesting /api/gallery/Sketches...")
        try:
            r = requests.get("http://localhost:3001/api/gallery/Sketches")
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                print("Response OK (Fix verified)")
            else:
                print(f"Failed: {r.text}")
        except Exception as e:
            print(f"Request failed: {e}")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except:
            proc.kill()

if __name__ == "__main__":
    test_gallery_api()
