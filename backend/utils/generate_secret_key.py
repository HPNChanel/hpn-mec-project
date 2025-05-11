#!/usr/bin/env python
"""
Utility script to generate a secure random secret key for the application.
This key can be used for JWT token signing in the .env file.
"""
import secrets
import string
import argparse
import base64
import os

def generate_secret_key_base64(length=32):
    """
    Generate a secure random secret key using base64 encoding.
    This avoids problematic characters like quotes and comment markers.
    
    Args:
        length: Number of random bytes to generate
               (resulting base64 string will be longer)
        
    Returns:
        A base64 encoded string suitable for use as a secret key
    """
    # Generate random bytes
    random_bytes = os.urandom(length)
    # Convert to base64 and remove padding characters
    base64_key = base64.urlsafe_b64encode(random_bytes).decode('utf-8').rstrip('=')
    return base64_key

def generate_secret_key_alphanumeric(length=64):
    """
    Generate a secure random secret key using only alphanumeric characters
    and a few safe special characters.
    
    Args:
        length: Length of the secret key to generate
        
    Returns:
        A string containing the generated secret key
    """
    # Use only alphanumeric characters and a few safe special characters
    safe_chars = string.ascii_letters + string.digits + "-_!@$*+:;"
    secret_key = ''.join(secrets.choice(safe_chars) for _ in range(length))
    return secret_key

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a secure secret key")
    parser.add_argument(
        "--length", 
        type=int, 
        default=64, 
        help="Length of the secret key (default: 64)"
    )
    parser.add_argument(
        "--env", 
        action="store_true", 
        help="Print the key in .env format (SECRET_KEY=<key>)"
    )
    parser.add_argument(
        "--method",
        choices=["base64", "alphanumeric"],
        default="base64",
        help="Method for generating the key (default: base64)"
    )
    
    args = parser.parse_args()
    
    if args.method == "base64":
        # Adjust length for base64 (base64 output is ~1.3x the input length)
        key = generate_secret_key_base64(args.length // 2)
    else:
        key = generate_secret_key_alphanumeric(args.length)
    
    if args.env:
        print(f"SECRET_KEY={key}")
    else:
        print(key)
    
    print("\n# Copy this key to your .env file or use the --env flag to get it in .env format.")
    print("# For security, don't share this key or commit it to version control.") 