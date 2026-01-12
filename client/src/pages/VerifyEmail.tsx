import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verify = async () => {
            try {
                if (token) {
                    await authApi.verifyEmail(token);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md glass-card text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                        {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
                    </div>
                    <CardTitle>
                        {status === 'verifying' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'verifying' && 'Please wait while we verify your account.'}
                        {status === 'success' && 'Your account has been successfully verified.'}
                        {status === 'error' && 'The verification link is invalid or has expired.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status !== 'verifying' && (
                        <Button asChild className="w-full">
                            <Link to="/login">Proceed to Login</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;
