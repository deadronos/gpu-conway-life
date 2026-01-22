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

