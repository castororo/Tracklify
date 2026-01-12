import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/v1`;

export const GoogleAuthButton = ({ text = 'Continue with Google' }: { text?: string }) => {
    const handleGoogleLogin = () => {
        // Determine the environment
        const isDev = window.location.hostname === 'localhost';

        // Construct the URL based on environment (Vite proxy vs direct backend)
        // Actually API_BASE_URL is reliable.
        // If we are using mock mode, this won't work, but we are in dev/prod.
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full relative py-5 border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            onClick={handleGoogleLogin}
        >
            <FcGoogle className="w-5 h-5 absolute left-4" />
            <span>{text}</span>
        </Button>
    );
};
