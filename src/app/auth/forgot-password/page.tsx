// 'use client'
// import { useState } from 'react';
// import axios from 'axios';

// export default function ForgotPassword() {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post('/api/auth/forgot-password', { email });
//       setMessage('Password reset email has been sent');
//       setError(''); // Clear any previous errors
//     } catch (err:any) {
//       setError(err.response?.data.message || 'Something went wrong');
//       setMessage(''); // Clear any previous success messages
//     }
//   };

//   return (
//     <div>
//       <h1>Forgot Password</h1>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {message && <p style={{ color: 'green' }}>{message}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Enter your email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// }


// New Code
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true); 
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('Password reset email has been sent');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
    finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="mt-6 text-2xl font-bold text-primary dark:text-primary-foreground">Forgot Password</CardTitle>
          </CardHeader>

          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary dark:text-primary-foreground">Email address</label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full" placeholder="you@example.com" />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-foreground">Send Reset Link</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}