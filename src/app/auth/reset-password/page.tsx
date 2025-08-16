// 'use client'
// import { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';

// export default function ResetPassword() {
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const router = useRouter();
//     //   const { token } = router.query; // Get the reset token from the query params
//     const searchParams = useSearchParams(); // Use to get query params
//     const token = searchParams.get('token'); // Get the reset token from the URL
//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();

//         try {
//             const { data } = await axios.post('/api/auth/reset-password', {
//                 token,
//                 password,
//             });

//             setSuccess('Password has been reset successfully.');
//             setTimeout(() => {
//                 router.push('/api/auth/login'); // Navigate to the login page
//             }, 2000);
//         } catch (error: any) {
//             setError(error.response?.data?.message || 'Something went wrong');
//         }
//     };

//     return (
//         <div>
//             <h1>Reset Password</h1>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {success && <p style={{ color: 'green' }}>{success}</p>}
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="password"
//                     placeholder="Enter new password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button type="submit">Reset Password</button>
//             </form>
//         </div>
//     );
// }



// New Code
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setSuccess('Password has been reset successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="mt-6 text-2xl font-bold text-primary-foreground">Reset Password</CardTitle>
          </CardHeader>

          <CardContent>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-primary-foreground">New Password</label>
                <Input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full" placeholder="Enter new password" />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-foreground">Reset Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}