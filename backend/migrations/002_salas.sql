CREATE TYPE tipo_sala AS ENUM ('texto', 'multimedia');
Create table salas (
    id UUID primary key default gen_random_uuid(),
    nombre varchar(100) not null unique,
    tipo tipo_sala not null,
    pin_hash varchar(255) null,
    pin_plano varchar(10) null,
    max_file_size_mb int default 10 check (max_file_size_mb > 0 AND max_file_size_mb <= 10),
    timeout_inactividad_min int default 5 check (timeout_inactividad_min > 0 AND timeout_inactividad_min < 60),
    creada_por UUID not null references administradores(id),
    activa boolean not null default true
);