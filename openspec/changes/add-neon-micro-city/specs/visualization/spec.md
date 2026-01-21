## ADDED Requirements

### Requirement: Neon Micro-City Visualization
The system SHALL render active cells as instanced meshes, using a simulation texture to determine occupancy and an alpha or age channel to drive color and intensity for bloom.

#### Scenario: Birth uses bloom and hot color
- **WHEN** a cell becomes alive
- **THEN** the corresponding instance is rendered with a bright color and bloom contribution
- **AND** the simulation's age channel for that cell is set to a maximum value

#### Scenario: Aging color fade
- **WHEN** a cell remains alive across frames
- **THEN** the shader maps the age channel to a color transition (hot → red → purple → faded)
- **AND** older cells exhibit reduced bloom intensity

#### Scenario: Performance constraint
- **WHEN** the scene initializes with 100k+ instances
- **THEN** rendering remains within target frame rate guidelines (see tasks for measurement)
