'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GoogleLogin.module.css';
import axios from 'axios';

export default function SignIn() {
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  // Handle Google sign-in callback and send token to backend
  const handleGoogleSignIn = async (response: any) => {
    setLoading(true); // Set loading to true when sign-in starts
    const token = response.credential;

    try {
      // Send the token to your backend to verify and get JWT
      const res = await axios.post("/api/auth/google", { token });

      if (res.status === 200) {
        // Extract role from the response
        const { role } = res.data;

        // Redirect based on the user's role
        if (role === 'USER') {
          router.push("/client");
        } else {
          // Handle other roles or unexpected roles if necessary
          router.push("/"); // Fallback or handle other cases
        }
      } else {
        console.error("Google sign-in failed");
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    } finally {
      setLoading(false); // Set loading to false after sign-in is complete or fails
    }
  };

  useEffect(() => {
    // Dynamically load the Google Sign-In API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize Google Sign-In after the script has loaded
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large' }
        );
      } else {
        console.error("Google Sign-In script failed to load.");
      }
    };

    script.onerror = () => {
      console.error("Failed to load Google Sign-In script.");
    };

    // Append the script to the body
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div>
      {loading && <div className={styles.loadingBar}>Loading...</div>} {/* Display loading indicator */}
      <div id="google-signin-btn" className={styles.button}></div> {/* Google Sign-In button will be rendered here */}
    </div>
  );
}
