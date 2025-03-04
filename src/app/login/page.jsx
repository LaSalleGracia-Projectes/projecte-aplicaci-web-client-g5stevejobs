import React from "react";
import Link from "next/link";

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">Inicia sesión</h1>
                <p className="text-center mb-4 text-gray-300">
                    ¿Aún no tienes una cuenta?{" "}
                    <Link href="/signup" className="text-blue-500">
                        ¡Regístrate!
                    </Link>
                </p>
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4">
                    Continuar con Google
                </button>
                <div className="text-center my-4 text-gray-300">o</div>
                <form>
                    <label className="block mb-2 text-gray-300">E-mail:</label>
                    <input type="email" className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100" />
                    <label className="block mb-2 text-gray-300">Contraseña:</label>
                    <input type="password" className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-700 text-gray-100" />
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-gray-300">
                            <input type="checkbox" className="mr-2" />
                            Recuérdame
                        </label>
                        <a href="#" className="text-blue-500">¿Olvidaste tu contraseña?</a>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
                        Inicia sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
