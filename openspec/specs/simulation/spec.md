# simulation Specification

## Purpose
TBD - created by archiving change add-rule-variants. Update Purpose after archive.
## Requirements
### Requirement: Configurable Life-like Rules

The system SHALL support switching the simulation update rule between at least standard Life (B3/S23) and HighLife (B36/S23) without requiring shader recompilation.

#### Scenario: Select HighLife rule

- **GIVEN** a running simulation using the default Life rule
- **WHEN** the user sets `rule` to `highlife`
- **THEN** subsequent simulation steps apply HighLife's birth/survival conditions

### Requirement: Custom Rule Input

The system SHALL support providing a custom Life-like rule using a standard rule notation (e.g., `B36/S23`) when `rule` is set to `custom`.

#### Scenario: Provide a custom rule string

- **WHEN** the consumer sets `rule` to `custom`
- **AND** provides a valid `ruleString`
- **THEN** the simulation runner converts it to an internal representation and applies it on subsequent steps

### Requirement: Default Rule Compatibility

The system SHALL default to standard Life (B3/S23), matching the current simulation behavior.

#### Scenario: No rule specified

- **WHEN** the consumer does not specify a rule
- **THEN** the simulation behaves identically to the pre-change implementation

### Requirement: Simulation as Reusable Texture

The system SHALL provide a programmatic API that produces a `THREE.Texture` representing the current simulation state and keeps it updated across frames.

#### Scenario: Consumer uses simulation texture on arbitrary mesh

- **WHEN** a consumer obtains the simulation texture via the new API
- **AND** applies it as a uniform (`uState`) or `map` on a mesh material
- **THEN** the mesh displays the simulation state and updates correctly as the simulation advances

### Requirement: Store-independent Simulation Core

The system SHALL provide a simulation runner that can be driven without relying on the app's Zustand store; callers SHALL provide simulation parameters explicitly.

#### Scenario: Consumer drives simulation in a non-R3F Three.js app

- **GIVEN** a `WebGLRenderer` and a configured simulation runner
- **WHEN** the consumer calls `step(deltaSeconds)` in their render loop
- **THEN** the runner updates the state texture deterministically based on the provided parameters

### Requirement: Provide a Reusable Material for Sampling

The system SHALL provide a reusable `ShaderMaterial` (`NeonLifeStateMaterial`) that encapsulates the sim sampling and color mapping logic and exposes friendly uniforms (`uState`, `uCellSize`, `uGridSize`).

#### Scenario: Consumer uses `NeonLifeStateMaterial`

- **WHEN** a consumer applies `NeonLifeStateMaterial` to any mesh and supplies the `uState` uniform with the simulation texture
- **THEN** the shader produces the same visual output as the existing `NeonCity` visualization (modulo UV orientation differences)

### Requirement: Documented State Texture Layout and UV Origin

The system SHALL document the simulation state texture channel layout and provide a supported mechanism to handle UV origin differences (e.g., a `uFlipY` uniform or equivalent).

#### Scenario: Consumer compensates for UV origin mismatch

- **GIVEN** a mesh whose UV origin differs from the simulation's expected origin
- **WHEN** the consumer enables the provided UV-origin compensation mechanism
- **THEN** the rendered mapping aligns with the consumer's expected orientation

### Requirement: Example and Documentation

The system SHALL include at least one example demonstrating usage of the sim texture on an arbitrary mesh and documentation that explains caveats (flipY, float texture support, disposal).

#### Scenario: Example validates feature

- **WHEN** the example is run in a supported browser/GPU
- **THEN** the example displays the simulation mapped onto the example geometry and README documents usage steps and caveats

