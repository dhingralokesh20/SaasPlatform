tatus: Accepted

Context:
The platform consists of multiple services and a frontend application.

Decision:
Use npm workspaces and Turbo to manage applications in a single repository.

Consequences:
+ Shared tooling
+ Shared packages
+ Easier onboarding
+ Simpler dependency management

- Requires discipline around service boundaries