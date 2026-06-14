### Issue: Angular showing tslib declaration errors

#### Error

```text
Could not find a declaration file for module 'tslib'
```

#### Observed

* Application compiled successfully.
* `ng serve` worked without issues.
* Error was only visible in VS Code.
* No runtime or build failures were observed.

#### Initial Assumptions

* Missing `tslib` typings.
* Corrupted `node_modules`.
* Angular configuration issue.
* TypeScript configuration issue.

#### Investigation

Verified `tslib` installation:

```bash
npm ls tslib
```

Verified Angular and TypeScript versions:

```bash
ng version
npm ls typescript
```

Discovered multiple TypeScript versions within the monorepo:

```text
Root: 6.0.3
UI: 5.9.3
Angular Compiler CLI: 6.0.3
```

Useful commands:

```bash
npm ls typescript
npm why typescript
```

Analysis of dependency resolution revealed:

* `@angular/build` expected TypeScript `>=5.9 <6.0`.
* UI package was configured to use TypeScript `6.0.3`.
* Multiple TypeScript versions were installed across the workspace.
* VS Code TypeScript Language Service surfaced misleading `tslib` errors.

#### Root Cause

TypeScript version mismatch inside the monorepo.

Specifically:

* Angular Build package expected TypeScript `5.9.x`.
* UI package was configured for TypeScript `6.0.3`.
* Dependency resolution installed multiple TypeScript versions.
* VS Code became confused by the inconsistent dependency graph and reported `tslib` declaration issues.

#### Resolution

1. Investigated dependency tree using:

```bash
npm ls typescript
npm why typescript
```

2. Aligned TypeScript versions with Angular requirements.

3. Reinstalled dependencies.

4. Restarted the VS Code TypeScript Language Service.

#### Lesson Learned

* Error messages often point to symptoms rather than root causes.
* Always inspect dependency trees before modifying application code.
* For monorepos, `npm ls` and `npm why` are often more useful than immediately changing configuration files.
* If an application builds and runs successfully, verify whether the issue is a tooling problem before changing business logic.
