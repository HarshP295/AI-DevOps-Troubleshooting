# PaymentService Runbook
## Overview
Handles all payment processing.

## Common Issues
### Database Connection Pool Issues
If the PaymentService is returning 503 errors and logs show `HikariPool-1 - Connection is not available`, it is likely a connection pool exhaustion issue.
- **Diagnosis**: Check the current max pool size in the DB config. (e.g. INC-4821 happened when deployment v1.8.2 changed pool settings on 2026-08-14).
- **Mitigation**: Rollback the configuration or manually increase `spring.datasource.hikari.maximum-pool-size` and restart the pods.

### High Latency
Check upstream payment gateway status.
