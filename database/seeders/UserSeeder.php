<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@dof.test',
                'password' => bcrypt('123'),
                'role' => 'admin',
                'group_name' => null,
            ],
            [
                'name' => 'Staff User',
                'email' => 'staff@dof.test',
                'password' => bcrypt('123'),
                'role' => 'user',
                'group_name' => 'Sekretariat',
            ],
            [
                'name' => 'Reviewer Utama',
                'email' => 'reviewer@dof.test',
                'password' => bcrypt('123'),
                'role' => 'reviewer',
                'group_name' => 'Pimpinan',
            ],
        ];

        foreach ($users as $user) {
            \App\Models\User::create($user);
        }
    }
}
