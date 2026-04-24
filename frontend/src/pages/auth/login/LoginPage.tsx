import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Package } from 'lucide-react';

interface LoginPageUIProps {
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  errors: any;
  isSubmitting: boolean;
}

export default function LoginPageUI({
  showPassword,
  setShowPassword,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting
}: LoginPageUIProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full">
               <img src="/asset-tracker-logo.png" className="h-20 w-20" alt="logo" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Asset Tracker</CardTitle>
          <CardDescription className="text-base">Enter your credentials to securely access your portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                {...register('email')} 
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Password</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')} 
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full text-md py-6 mt-4 transition-all hover:scale-[1.02]" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
