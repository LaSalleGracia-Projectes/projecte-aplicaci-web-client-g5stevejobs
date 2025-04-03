import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Confirmar el email
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Error al confirmar email:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Email confirmation failed`);
      }

      if (user) {
        // Verificar si el perfil ya existe
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          // Crear el perfil usando el username guardado en los metadatos
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: user.user_metadata.username,
                email: user.email
              }
            ]);

          if (profileError) {
            console.error('Error al crear el perfil:', profileError);
            return NextResponse.redirect(`${requestUrl.origin}/login?error=Profile creation failed`);
          }
        }

        // Redirigir al dashboard después de la verificación exitosa
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
    } catch (error) {
      console.error('Error en el proceso de verificación:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Verification process failed`);
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
} 