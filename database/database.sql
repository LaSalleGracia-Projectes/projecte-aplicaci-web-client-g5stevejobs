-- Habilitar la extensión para UUID en PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: Perfil (Vinculada directamente a auth.users)
CREATE TABLE perfil (
    id_perfil UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar TEXT,
    descripcion TEXT,
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Publicación
CREATE TABLE Publicacion (
    ID_publicacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    topico VARCHAR(50),
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT NOW(),
    ultima_publicacion TIMESTAMP DEFAULT NOW(),
    estatus BOOLEAN DEFAULT TRUE,
    ID_perfil UUID NOT NULL REFERENCES Perfil(ID_perfil) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Comentario
CREATE TABLE Comentario (
    ID_comentario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT NOW(),
    ID_perfil UUID NOT NULL REFERENCES Perfil(ID_perfil) ON DELETE CASCADE,
    ID_publicacion UUID NOT NULL REFERENCES Publicacion(ID_publicacion) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Partida
CREATE TABLE Partida (
    ID_partida UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_guardado TIMESTAMP DEFAULT NOW(),
    nivel INT NOT NULL,
    finalizado BOOLEAN DEFAULT FALSE,
    estado_juego VARCHAR(50),
    tiempo_jugado INTERVAL,
    ID_perfil UUID NOT NULL REFERENCES Perfil(ID_perfil) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Configuración
CREATE TABLE Configuracion (
    ID_configuracion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ID_perfil UUID NOT NULL REFERENCES Perfil(ID_perfil) ON DELETE CASCADE,
    sonido BOOLEAN DEFAULT TRUE,
    musica BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Logro
CREATE TABLE Logro (
    ID_logro UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_logro VARCHAR(100) NOT NULL,
    imagen_logro TEXT,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Partida_Logro
CREATE TABLE Partida_Logro (
    ID_partida UUID NOT NULL REFERENCES Partida(ID_partida) ON DELETE CASCADE,
    ID_logro UUID NOT NULL REFERENCES Logro(ID_logro) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (ID_partida, ID_logro)
);

-- Tabla: Inventario
CREATE TABLE Inventario (
    ID_inventario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cantidad INT DEFAULT 1,
    ID_partida UUID NOT NULL REFERENCES Partida(ID_partida) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Item
CREATE TABLE Item (
    ID_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_imagen TEXT,
    nombre_item VARCHAR(100) NOT NULL,
    atributo VARCHAR(50),
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Inventario_Item
CREATE TABLE Inventario_Item (
    ID_inventario UUID NOT NULL REFERENCES Inventario(ID_inventario) ON DELETE CASCADE,
    ID_item UUID NOT NULL REFERENCES Item(ID_item) ON DELETE CASCADE,
    PRIMARY KEY (ID_inventario, ID_item)
);

-- Políticas de seguridad en Supabase
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura de perfiles"
    ON perfil FOR SELECT
    USING (true);

-- Política para permitir actualización solo al propio usuario
CREATE POLICY "Permitir actualización de perfil propio"
    ON perfil FOR UPDATE
    USING (auth.uid() = id_perfil);

-- Política para permitir eliminación solo al propio usuario
CREATE POLICY "Permitir eliminación de perfil propio"
    ON perfil FOR DELETE
    USING (auth.uid() = id_perfil);

-- Política para permitir inserción durante el registro
CREATE POLICY "Permitir inserción de perfil durante registro"
    ON perfil FOR INSERT
    WITH CHECK (true);
