# Visualization - spec deltas

## ADDED Requirements

### Requirement: Neon Micro-City Visualization

The system SHALL render active cells as instanced meshes (boxes), using a simulation texture to determine occupancy and an alpha or age channel to drive color, intensity for bloom, and building height.

#### Scenario: City block geometry

- **WHEN** the scene initializes
- **THEN** each instance SHALL have a 1x1 world unit footprint (length x width)
- **AND** the height SHALL be proportional to the cell's age (freshly born = tallest)

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

### Requirement: Interactive Controls

The system SHALL provide a Leva-based UI for real-time parameter tuning.

#### Scenario: Update frequency control

- **GIVEN** a running simulation
- **WHEN** the user modifies the `ticksPerSecond` control
- **THEN** the simulation update frequency adjusts proportionally (e.g. 60 TPS = 16.6ms delay)

#### Scenario: Visual tuning

- **WHEN** the user modifies bloom or emission parameters
- **THEN** the shader uniforms and post-processing effects update without scene reload
