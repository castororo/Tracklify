import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import gsap from 'gsap';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            if (token) {
                await authApi.resetPassword(token, password);
                toast({ title: 'Success', description: 'Your password has been reset. Please sign in.' });
                navigate('/login');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to reset password', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div ref={formRef} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-foreground font-bold text-xl">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-muted-foreground mt-2">Enter your new password below</p>
                </div>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>New Password</CardTitle>
                        <CardDescription>Make sure it's secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            <Link to="/login" className="text-primary hover:underline">Back to Sign in</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
