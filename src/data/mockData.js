// Mock data for MiC Data Platform
// Based on the dataFromPolyU Excel structure

// Projects data
const projects = [
  {
    project_id: 'PRJ001',
    project_name: 'Nam Cheong 220',
    location: 'Nam Cheong, Hong Kong',
    total_units: 24,
    start_date: '03/19', // 按照 mm/yy 格式
    module_release_date: '09/23', // 按照 mm/yy 格式
    module_life_span: 47,
    client: 'Hong Kong Housing Authority',
    primary_structural_material: 'Steel',
    contractor: 'CIMC-MBS',
    manufacturer: 'CIMC Modular Building',
    operator: 'Hong Kong Housing Authority',
    site_location: 'Nam Cheong Station, West Kowloon',
    building_height: '18.5m',
    num_floors: 6,
    unit_types: 'Studio, 1-Bedroom',
    total_modules: 48,
    structural_system: 'Steel Framing',
    other_actors: 'Architectural Services Department',
    ap_rec_rc: 'Approved',
    project_status: 'Completed',
    description: 'A transitional housing project using modular integrated construction methods. The project serves as a temporary housing solution for underprivileged families.',
    image_url: 'https://example.com/projects/nam-cheong-220.jpg'
  },
  {
    project_id: 'PRJ002',
    project_name: 'LST Housing',
    location: 'Lok Sin Tong, Kowloon',
    total_units: 35,
    start_date: '06/20', // 按照 mm/yy 格式
    module_release_date: '08/23', // 按照 mm/yy 格式
    module_life_span: 47,
    client: 'Lok Sin Tong Benevolent Society',
    primary_structural_material: 'Steel-Concrete Hybrid',
    contractor: 'Hip Hing Construction',
    manufacturer: 'Hip Hing MiC Factory',
    operator: 'Lok Sin Tong Benevolent Society',
    site_location: 'To Kwa Wan, Kowloon',
    building_height: '21.0m',
    num_floors: 7,
    unit_types: '1-Bedroom, 2-Bedroom',
    total_modules: 70,
    structural_system: 'Steel-Concrete Hybrid',
    other_actors: 'Hong Kong Housing Society',
    ap_rec_rc: 'Approved',
    project_status: 'Completed',
    description: 'Affordable housing project using MiC techniques to speed up construction and reduce costs. The project focuses on community integration and sustainable design.',
    image_url: 'https://example.com/projects/lst-housing.jpg'
  },
  {
    project_id: 'PRJ003',
    project_name: 'James Concourse',
    location: 'Yau Tong, Kowloon',
    total_units: 42,
    start_date: '01/22', // 按照 mm/yy 格式
    module_release_date: null, // 还未发布
    module_life_span: null, // 未知
    client: 'Urban Renewal Authority',
    primary_structural_material: 'Steel',
    contractor: 'Gammon Construction',
    manufacturer: 'Gammon MiC Factory',
    operator: 'Urban Renewal Authority',
    site_location: 'Yau Tong Bay, Kowloon',
    building_height: '32.5m',
    num_floors: 10,
    unit_types: 'Studio, 1-Bedroom, 2-Bedroom',
    total_modules: 84,
    structural_system: 'Volumetric Modular Construction',
    other_actors: 'Hong Kong Housing Society',
    ap_rec_rc: 'In Review',
    project_status: 'In Progress',
    description: 'Urban renewal project using MiC methods to minimize construction waste and disruption to the surrounding community. The project integrates commercial and residential spaces.',
    image_url: 'https://example.com/projects/james-concourse.jpg'
  },
  {
    project_id: 'PRJ004',
    project_name: 'United Court',
    location: 'Sha Tin, New Territories',
    total_units: 30,
    start_date: '09/22', // 按照 mm/yy 格式
    module_release_date: null, // 还未发布
    module_life_span: null, // 未知
    client: 'Hong Kong Housing Society',
    primary_structural_material: 'Concrete',
    contractor: 'China State Construction',
    manufacturer: 'China State MiC Division',
    operator: 'Hong Kong Housing Society',
    site_location: 'Sha Tin District, New Territories',
    building_height: '27.8m',
    num_floors: 9,
    unit_types: '1-Bedroom, 2-Bedroom, 3-Bedroom',
    total_modules: 60,
    structural_system: 'Precast Concrete Modular',
    other_actors: 'Architectural Services Department',
    ap_rec_rc: 'In Review',
    project_status: 'In Progress',
    description: 'Public housing project designed with MiC to accelerate delivery of affordable homes. The project emphasizes green spaces and community facilities.',
    image_url: 'https://example.com/projects/united-court.jpg'
  }
];

// Units data (for each project)
const units = [
  // PRJ001 Units (Nam Cheong 220)
  {
    unit_id: 'UNIT001',
    project_id: 'PRJ001',
    location_in_project: 'Block A, 1/F',
    temporal_location: 'First Phase',
    intended_use: 'Residential',
    spatial_design: 'Studio',
    facilities: 'Basic Kitchen, Bathroom',
    mep_systems: 'Standard Electrical, Plumbing',
    connections: 'Quick Connect',
    standard_details: 'Standard MiC layout',
    module_conditions: 'Excellent',
    work_methods: 'Standard Installation',
    dfs_concerns: 'None',
    floor_number: 1,
    unit_number: '1A',
    area: 21.5,
    bedrooms: 0,
    bathrooms: 1,
    status: 'Occupied'
  },
  {
    unit_id: 'UNIT002',
    project_id: 'PRJ001',
    location_in_project: 'Block A, 1/F',
    temporal_location: 'First Phase',
    intended_use: 'Residential',
    spatial_design: '1-Bedroom',
    facilities: 'Kitchen, Bathroom, Living Room',
    mep_systems: 'Standard Electrical, Plumbing',
    connections: 'Quick Connect',
    standard_details: 'Standard MiC layout',
    module_conditions: 'Excellent',
    work_methods: 'Standard Installation',
    dfs_concerns: 'None',
    floor_number: 1,
    unit_number: '1B',
    area: 35.8,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Occupied'
  },
  {
    unit_id: 'UNIT003',
    project_id: 'PRJ001',
    location_in_project: 'Block A, 2/F',
    temporal_location: 'First Phase',
    intended_use: 'Residential',
    spatial_design: 'Studio',
    facilities: 'Basic Kitchen, Bathroom',
    mep_systems: 'Standard Electrical, Plumbing',
    connections: 'Quick Connect',
    standard_details: 'Standard MiC layout',
    module_conditions: 'Good',
    work_methods: 'Standard Installation',
    dfs_concerns: 'None',
    floor_number: 2,
    unit_number: '2A',
    area: 21.5,
    bedrooms: 0,
    bathrooms: 1,
    status: 'Occupied'
  },

  // PRJ002 Units (LST Housing)
  {
    unit_id: 'UNIT004',
    project_id: 'PRJ002',
    location_in_project: 'Tower 1, 1/F',
    temporal_location: 'Phase 1',
    intended_use: 'Residential',
    spatial_design: '1-Bedroom',
    facilities: 'Kitchen, Bathroom, Living Room',
    mep_systems: 'Enhanced Electrical, Plumbing, HVAC',
    connections: 'Bolted Connection',
    standard_details: 'LST Standard Layout',
    module_conditions: 'Excellent',
    work_methods: 'Standard Installation',
    dfs_concerns: 'None',
    floor_number: 1,
    unit_number: '1A',
    area: 32.5,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Occupied'
  },
  {
    unit_id: 'UNIT005',
    project_id: 'PRJ002',
    floor_number: 1,
    unit_number: '1B',
    unit_type: '2-Bedroom',
    area: 45.2,
    bedrooms: 2,
    bathrooms: 1,
    status: 'Occupied'
  },
  {
    unit_id: 'UNIT006',
    project_id: 'PRJ002',
    floor_number: 2,
    unit_number: '2A',
    unit_type: '2-Bedroom',
    area: 46.8,
    bedrooms: 2,
    bathrooms: 1,
    status: 'Vacant'
  },

  // PRJ003 Units (James Concourse)
  {
    unit_id: 'UNIT007',
    project_id: 'PRJ003',
    floor_number: 1,
    unit_number: '1A',
    unit_type: 'Studio',
    area: 25.2,
    bedrooms: 0,
    bathrooms: 1,
    status: 'Under Construction'
  },
  {
    unit_id: 'UNIT008',
    project_id: 'PRJ003',
    floor_number: 1,
    unit_number: '1B',
    unit_type: '1-Bedroom',
    area: 38.4,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Under Construction'
  },
  {
    unit_id: 'UNIT009',
    project_id: 'PRJ003',
    floor_number: 2,
    unit_number: '2A',
    unit_type: '2-Bedroom',
    area: 52.5,
    bedrooms: 2,
    bathrooms: 2,
    status: 'Under Construction'
  },

  // PRJ004 Units (United Court)
  {
    unit_id: 'UNIT010',
    project_id: 'PRJ004',
    floor_number: 1,
    unit_number: '1A',
    unit_type: '1-Bedroom',
    area: 36.8,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Under Construction'
  },
  {
    unit_id: 'UNIT011',
    project_id: 'PRJ004',
    floor_number: 1,
    unit_number: '1B',
    unit_type: '2-Bedroom',
    area: 48.5,
    bedrooms: 2,
    bathrooms: 1,
    status: 'Under Construction'
  },
  {
    unit_id: 'UNIT012',
    project_id: 'PRJ004',
    floor_number: 2,
    unit_number: '2A',
    unit_type: '3-Bedroom',
    area: 62.3,
    bedrooms: 3,
    bathrooms: 2,
    status: 'Under Construction'
  }
];

// Modules data
const modules = [
  // UNIT001 Modules
  {
    module_id: 'NC220-M001',
    unit_id: 'UNIT001',
    major_material: 'Steel',
    module_location: 'Living Space',
    temporal_location: 'Installed 09/19',
    intended_use: 'Residential',
    weight: '5.2 tonnes',
    manufacturer: 'CIMC Modular Building',
    ap_rse_rc: 'Approved',
    use_history: 'First use',
    primary_material: 'Steel',
    load_bear_capacity: '4-Floor Building',
    remaining_life_span: 47,
    module_condition: 'Excellent',
    fire_resistance: 'Class A, 120 minutes',
    quality_assurance: 'ISO 9001 Certified',
    design_drawings: 'Available',
    transportation: 'Standard Truck Transport',
    damage_prevention: 'Weatherproof Packaging',
    work_procedure: 'Standard Installation',
    work_methods: 'Crane Lift Installation',
    dfs_specifications: 'Follows Hong Kong Building Code',
    module_type: 'Residential (1-person)',
    manufacturing_date: '2019-06-15',
    installation_date: '2019-09-20',
    dimensions: '6m × 3m × 3m',
    status: 'Available',
    quality_grade: 'A',
    maintenance_history: 'Routine inspection (2023-04-15): All systems operational.',
    technical_specifications: 'Fire rating: 120 minutes, Sound insulation: 45dB'
  },
  {
    module_id: 'NC220-M002',
    unit_id: 'UNIT001',
    major_material: 'Concrete',
    module_location: 'Bathroom',
    temporal_location: 'Installed 09/19',
    intended_use: 'Sanitary Facilities',
    weight: '3.8 tonnes',
    manufacturer: 'CIMC Modular Building',
    ap_rse_rc: 'Approved',
    use_history: 'First use',
    primary_material: 'Concrete',
    load_bear_capacity: '8-Floor Building',
    remaining_life_span: 47,
    module_condition: 'Excellent',
    fire_resistance: 'Class A',
    quality_assurance: 'ISO 9001 Certified',
    design_drawings: 'Available',
    transportation: 'Standard Truck Transport',
    damage_prevention: 'Weatherproof Packaging',
    work_procedure: 'Standard Installation',
    work_methods: 'Crane Lift Installation',
    dfs_specifications: 'Follows Hong Kong Building Code',
    module_type: 'Bathroom',
    manufacturing_date: '2019-06-18',
    installation_date: '2019-09-21',
    dimensions: '2.5m × 2m × 3m',
    weight: 3.8,
    status: 'Available',
    quality_grade: 'A',
    maintenance_history: 'Plumbing system upgrade (2022-08-10), Routine inspection (2023-04-15)',
    technical_specifications: 'Waterproof rating: IP67, Anti-slip flooring: Class R11'
  },

  // UNIT003 Modules
  {
    module_id: 'NC220-M015',
    unit_id: 'UNIT003',
    module_type: 'Bathroom',
    manufacturer: 'CIMC Modular Building',
    manufacturing_date: '2019-07-05',
    installation_date: '2019-10-05',
    material: 'Concrete',
    load_capacity: '8-Floor Building',
    dimensions: '2.5m × 2m × 3m',
    weight: 3.9,
    status: 'Maintenance',
    quality_grade: 'B',
    remaining_life: 46,
    maintenance_history: 'Water damage repair (2023-03-10), Plumbing system check (2023-06-01)',
    technical_specifications: 'Waterproof rating: IP67, Anti-slip flooring: Class R11'
  },

  // UNIT004 Modules (LST Housing)
  {
    module_id: 'LST-M042',
    unit_id: 'UNIT004',
    module_type: 'Residential (2-3 person)',
    manufacturer: 'Hip Hing MiC Factory',
    manufacturing_date: '2020-10-12',
    installation_date: '2021-02-18',
    material: 'Steel-Concrete Hybrid',
    load_capacity: '4-Floor Building',
    dimensions: '7.2m × 3.2m × 3m',
    weight: 6.8,
    status: 'In Use',
    quality_grade: 'A',
    remaining_life: 47,
    maintenance_history: 'Initial installation (2021-02-18), Routine inspection (2023-01-10)',
    technical_specifications: 'Fire rating: 120 minutes, Sound insulation: 50dB'
  },

  // UNIT005 Modules (LST Housing)
  {
    module_id: 'LST-M028',
    unit_id: 'UNIT005',
    module_type: 'Residential (4-5 person)',
    manufacturer: 'Hip Hing MiC Factory',
    manufacturing_date: '2020-09-22',
    installation_date: '2021-01-30',
    material: 'Steel',
    load_capacity: '3-Floor Building',
    dimensions: '8m × 4m × 3m',
    weight: 7.5,
    status: 'Available',
    quality_grade: 'A',
    remaining_life: 47,
    maintenance_history: 'Initial installation (2021-01-30), Decommissioned (2023-06-15), Refurbishment (2023-07-20)',
    technical_specifications: 'Fire rating: 90 minutes, Sound insulation: 45dB'
  }
];

// Module attributes data
const moduleAttributes = [
  // Attributes for NC220-M001
  {
    attribute_id: 1,
    module_id: 'NC220-M001',
    attribute_name: 'Structural Integrity',
    attribute_value: 'Passed (2023-04-15)'
  },
  {
    attribute_id: 2,
    module_id: 'NC220-M001',
    attribute_name: 'MEP Systems',
    attribute_value: 'Functional'
  },
  {
    attribute_id: 3,
    module_id: 'NC220-M001',
    attribute_name: 'Current Location',
    attribute_value: 'Hong Sui Kiu Storage'
  },
  {
    attribute_id: 4,
    module_id: 'NC220-M001',
    attribute_name: 'Transport Ready',
    attribute_value: 'Yes'
  },

  // Attributes for NC220-M002
  {
    attribute_id: 5,
    module_id: 'NC220-M002',
    attribute_name: 'Plumbing Condition',
    attribute_value: 'Excellent'
  },
  {
    attribute_id: 6,
    module_id: 'NC220-M002',
    attribute_name: 'Waterproofing Test',
    attribute_value: 'Passed (2023-04-15)'
  },
  {
    attribute_id: 7,
    module_id: 'NC220-M002',
    attribute_name: 'Current Location',
    attribute_value: 'Hong Sui Kiu Storage'
  },

  // Attributes for NC220-M015
  {
    attribute_id: 8,
    module_id: 'NC220-M015',
    attribute_name: 'Repair Status',
    attribute_value: 'In progress'
  },
  {
    attribute_id: 9,
    module_id: 'NC220-M015',
    attribute_name: 'Estimated Completion',
    attribute_value: '2023-08-15'
  },
  {
    attribute_id: 10,
    module_id: 'NC220-M015',
    attribute_name: 'Current Location',
    attribute_value: 'Hong Sui Kiu Storage'
  },

  // Attributes for LST-M042
  {
    attribute_id: 11,
    module_id: 'LST-M042',
    attribute_name: 'Install Time',
    attribute_value: '4.5 hours'
  },
  {
    attribute_id: 12,
    module_id: 'LST-M042',
    attribute_name: 'Connection Type',
    attribute_value: 'Quick-connect bolted'
  },
  {
    attribute_id: 13,
    module_id: 'LST-M042',
    attribute_name: 'Current Location',
    attribute_value: 'To Kwa Wan'
  },

  // Attributes for LST-M028
  {
    attribute_id: 14,
    module_id: 'LST-M028',
    attribute_name: 'Available From',
    attribute_value: '2023-08-01'
  },
  {
    attribute_id: 15,
    module_id: 'LST-M028',
    attribute_name: 'Reuse Certification',
    attribute_value: 'Approved (2023-07-30)'
  },
  {
    attribute_id: 16,
    module_id: 'LST-M028',
    attribute_name: 'Current Location',
    attribute_value: 'To Kwa Wan Storage'
  }
];

// Module search index for faster searches
const moduleSearchIndex = [
  {
    index_id: 1,
    module_id: 'NC220-M001',
    project_id: 'PRJ001',
    unit_id: 'UNIT001',
    module_type: 'Residential (1-person)',
    major_material: 'Steel',
    status: 'Available',
    manufacturer: 'CIMC Modular Building',
    intended_use: 'Residential',
    remaining_life_span: 47
  },
  {
    index_id: 2,
    module_id: 'NC220-M002',
    project_id: 'PRJ001',
    unit_id: 'UNIT001',
    module_type: 'Bathroom',
    major_material: 'Concrete',
    status: 'Available',
    manufacturer: 'CIMC Modular Building',
    intended_use: 'Sanitary Facilities',
    remaining_life_span: 47
  }
];

module.exports = {
  projects,
  units,
  modules,
  moduleAttributes,
  moduleSearchIndex
}; 