import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import gsap from 'gsap';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authApi.forgotPassword(email);
            setIsSent(true);
            toast({ title: 'Email sent', description: 'Check your inbox for the reset link.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to send reset email', variant: 'destructive' });
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
                    <h1 className="text-2xl font-bold">Account Recovery</h1>
                    <p className="text-muted-foreground mt-2">Reset your password to regain access</p>
                </div>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>
                            {isSent ? 'We have sent you a reset link.' : 'Enter your email to receive a reset link.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                                    If an account exists for <strong>{email}</strong>, you will receive an email shortly.
                                    <br /><br />
                                    (Simulated: Check the server console for the link)
                                </div>
                            </div>
                        )}
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Remember your password? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
