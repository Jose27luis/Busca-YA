<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => '18121040@unamad.edu.pe'],
            [
                'name' => 'Administrador',
                'password' => '75318092',
                'rol' => 'admin',
            ],
        );
    }
}
