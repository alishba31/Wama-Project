// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import SignIn from '../google-sign-in/page';
// import axios from 'axios';

// export default function Login() {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [emailError, setEmailError] = useState<string>('');
//   const [passwordError, setPasswordError] = useState<string>('');
//   const router = useRouter();

//   // Form Validation Function
//   const validateForm = () => {
//     let isValid = true;

//     // Reset errors
//     setEmailError('');
//     setPasswordError('');

//     // Validate Email Format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setEmailError('Please enter a valid email address.');
//       isValid = false;
//     }

//     // Check if email is empty
//     if (email.trim() === '') {
//       setEmailError('Email is required.');
//       isValid = false;
//     }

//     // Validate Password Length
//     if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters long.');
//       isValid = false;
//     }

//     // Check if password is empty
//     if (password.trim() === '') {
//       setPasswordError('Password is required.');
//       isValid = false;
//     }

//     return isValid;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate the form before submitting
//     if (!validateForm()) {
//       return; // Stop form submission if validation fails
//     }

//     try {
//       const res = await axios.post('/api/auth/login', {
//         email,
//         password,
//       });

//       if (res.status === 200) {
//         const user = res.data; // Assuming response contains user details including role
//         const role = user.role;

//         console.log("User logged in successfully:", user);
//         console.log("User role:", role);

//         // Role-based redirection after successful login
//         if (role === 'ADMIN') {
//           console.log("Redirecting to /admin...");
//           router.push('/admin/dashboard');
//         } else if (role === 'EDITOR') {
//           console.log("Redirecting to /editor...");
//           router.push('/editor');
//         } else if (role === 'USER') {
//           console.log("Redirecting to /user...");
//           router.push('/client');
//         }
//       }
//     } catch (error: any) {
//       if (error.response && error.response.data) {
//         setError(error.response.data.message || 'Invalid email or password');
//       } else {
//         setError('An error occurred. Please try again.');
//       }
//     }
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
//         </div>
//         <div>
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
//         </div>
//         <button type="submit">Login</button>
//       </form>
//       <p>
//         Forgot your password?{' '}
//         <a href="/auth/forgot-password">Click here to reset</a>
//       </p>
//       <SignIn/>
//     </div>
//   );
// }



// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import SignIn from '../google-sign-in/page';
// import axios from 'axios';
// import styles from './Login.module.css'; // Import the CSS module


// export default function Login() {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [emailError, setEmailError] = useState<string>('');
//   const [passwordError, setPasswordError] = useState<string>('');
//   const router = useRouter();

//   // Form Validation Function
//   const validateForm = () => {
//     let isValid = true;

//     // Reset errors
//     setEmailError('');
//     setPasswordError('');

//     // Validate Email Format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setEmailError('Please enter a valid email address.');
//       isValid = false;
//     }

//     // Check if email is empty
//     if (email.trim() === '') {
//       setEmailError('Email is required.');
//       isValid = false;
//     }

//     // Validate Password Length
//     if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters long.');
//       isValid = false;
//     }

//     // Check if password is empty
//     if (password.trim() === '') {
//       setPasswordError('Password is required.');
//       isValid = false;
//     }

//     return isValid;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate the form before submitting
//     if (!validateForm()) {
//       return; // Stop form submission if validation fails
//     }

//     try {
//       const res = await axios.post('/api/auth/login', {
//         email,
//         password,
//       });

//       if (res.status === 200) {
//         const user = res.data; // Assuming response contains user details including role
//         const role = user.role;

//         console.log("User logged in successfully:", user);
//         console.log("User role:", role);

//         // Role-based redirection after successful login
//         if (role === 'ADMIN') {
//           console.log("Redirecting to /admin...");
//           router.push('/admin/dashboard');
//         } else if (role === 'EDITOR') {
//           console.log("Redirecting to /editor...");
//           router.push('/editor');
//         } else if (role === 'USER') {
//           console.log("Redirecting to /user...");
//           router.push('/client');
//         }
//       }
//     } catch (error: any) {
//       if (error.response && error.response.data) {
//         setError(error.response.data.message || 'Invalid email or password');
//       } else {
//         setError('An error occurred. Please try again.');
//       }
//     }
//   };

//   return (
    
//     <div className={styles.container}>
//       <div className={styles.formContainer}>
//         <form onSubmit={handleSubmit}>
//           <h1>Sign In</h1>
//           {error && <p className={styles.errorMessage}>{error}</p>}
//           <div>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className={styles.inputField}
//             />
//             {emailError && <p className={styles.errorMessage}>{emailError}</p>}
//           </div>
//           <div>
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className={styles.inputField}
//             />
//             {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
//           </div>
//           <a href="/auth/forgot-password" className={styles.link}>Forgot Your Password?</a>
//           <button type="submit" className={styles.submitBtn}>Sign In</button>
//           <SignIn/>
//         </form>
//       </div>
//     </div>
//   );
// }


// New Code
'use client';
import Logo from '@/components/logo.svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingBar from '@/components/ui/loadingbartop';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Circles } from 'react-loader-spinner';
import SignIn from '../google-sign-in/page';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // Add progress state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 20 : 100));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Form Validation Function
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
    if (email.trim() === '') {
      setEmailError('Email is required.');
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,25}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be at least 6 characters long, contain one capital letter, and one special character.");
      isValid = false;
    }
    if (password.trim() === '') {
      setPasswordError('Password is required.');
      isValid = false;
    }
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form before submitting
    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (res.status === 200) {
        const user = res.data; // Assuming response contains user details including role
        const role = user.role;

        console.log("User logged in successfully:", user);
        console.log("User role:", role);

        // Role-based redirection after successful login
        if (role === 'ADMIN') {
          console.log("Redirecting to /admin...");
          router.push('/admin');
        } else if (role === 'OEM') {
          console.log("Redirecting to /oem...");
          router.push('/oem');
        } else if (role === 'USER' || role === 'User' || role === 'user') {
          console.log("Redirecting to /user...");
          router.push('/client');
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
    finally {
      setIsLoading(false); // Hide loading spinner
      setProgress(0);
    }
  };


  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <Image src={Logo} alt="Logo" className="mx-auto size-14" />
            <CardTitle className="mt-6 text-2xl font-bold text-primary dark:text-primary-foreground">Login to your account</CardTitle>
          </CardHeader>
          {isLoading && <LoadingBar progress={progress} />} {/* Loading Bar */}
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-500">{error}</p>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary dark:text-primary-foreground">Email address</label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full" placeholder="you@example.com" />
                {emailError && <p className="text-red-500">{emailError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-primary dark:text-primary-foreground">Password</label>
                  <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary hover:text-accent">Forgot password?</Link>
                </div>
                <div className="relative mt-2">
                  <Input id="password" type={isPasswordVisible ? 'text' : 'password'} required value={password} maxLength={12} onChange={(e) => setPassword(e.target.value)} className="block w-full" placeholder="Your password" />
                  {passwordError && <p className="text-red-500">{passwordError}</p>}
                  <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-semibold text-primary-foreground">
                    {isPasswordVisible ? <Eye className="h-5 w-5 text-gray-500" /> : <EyeOff className="h-5 w-5 text-gray-500" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant={'outline'} className="w-full bg-primary hover:bg-white dark:hover:bg-slate-300">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                  <Circles height={80} width={80} color="#000000" visible={true} /> {/* Larger Spinner */}
                  </div>
                  ) : ('Sign in')}
                  </Button>
            </form>
            {/* Divider with OR */}
            <div className="my-3 flex items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            {/* Google sign-in button */}
            <div className="mx-12 flex items-center justify-center">
              <SignIn /> {/* Render the Google sign-in component here */}
            </div>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="mx-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <p className="mx-auto text-sm text-muted-foreground">
              Don't have account? <Link href="/auth/signup" className="font-semibold text-primary hover:text-accent">Signup</Link>
            </p>
            
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}