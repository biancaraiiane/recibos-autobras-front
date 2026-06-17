'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLogin } from '@/hooks/auth/useLogin';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    login(data, {
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        showToast('error', error?.response?.data?.message || 'E-mail ou senha incorretos.');
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1e3c] flex-col items-center justify-center p-12">
        <div className="relative w-56 h-28 mb-8">
          <Image
            src="/logo-autobras.png"
            alt="Autobras"
            fill
            className="object-contain"
            priority
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-3">Sistema de Recibos</h1>
        <p className="text-slate-400 text-center text-sm max-w-xs">
          Gere invoices profissionais da Autobras LLC de forma rápida e segura.
        </p>
        <div className="mt-12 text-slate-500 text-xs text-center">
          © {new Date().getFullYear()} Autobras LLC. Todos os direitos reservados.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative w-40 h-20">
              <Image
                src="/logo-autobras.png"
                alt="Autobras"
                fill
                className="object-contain"
                priority
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Bem-vindo(a)!</h2>
              <p className="text-slate-500 text-sm mt-1">Faça login para acessar o sistema.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                leftIcon={<FiMail size={15} />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FiLock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full rounded-lg border pl-9 pr-10 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.senha ? 'border-red-400' : 'border-slate-300'}`}
                    {...register('senha')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-500">{errors.senha.message}</p>}
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-blue-600 hover:underline">
                  Esqueceu sua senha?
                </button>
              </div>

              <Button type="submit" loading={isPending} fullWidth size="lg">
                Entrar
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
