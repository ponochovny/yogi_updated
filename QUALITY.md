# Quality baseline

The project currently reports coverage without enforced thresholds. This is intentional until the test suite and uncovered areas are reviewed.

Baseline recorded on 2026-09-20 with Vitest 4.1.10 and the V8 provider:

| Scope                    | Statements | Branches | Functions |  Lines |
| ------------------------ | ---------: | -------: | --------: | -----: |
| Unit tests               |     58.13% |   58.38% |    18.30% | 59.28% |
| Nuxt tests               |     36.36% |    1.32% |     1.40% | 37.97% |
| CI aggregate (`test:ci`) |     53.29% |   33.22% |    11.11% | 55.39% |

The CI `test:ci` command keeps coverage reporting enabled but does not fail on a global threshold. Thresholds should be introduced only after the baseline and test gaps have been analyzed.
