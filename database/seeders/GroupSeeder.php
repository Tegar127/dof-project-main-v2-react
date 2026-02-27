<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            'Kepatuhan & Hukum',
            'Strategi SDM',
            'Kepesertaan',
            'Sistem Informasi',
            'Personalia',
            'Pelatihan & Pengembangan',
            'Umum',
            'Sekretariat Perusahaan'
        ];

        foreach ($groups as $group) {
            \App\Models\Group::updateOrCreate(['name' => $group]);
        }
    }
}
