# Service: `assistant.miloapis.com`

The Datum Cloud AI assistant — a conversational interface embedded in
the cloud portal that helps users explore their resources, understand
telemetry, and run guided workflows.

This page is the catalog-side documentation for the service. Runtime
concerns (the assistant's deployment, the model provider it talks to,
the chat UI) live in
[`datum-cloud/cloud-portal`](https://github.com/datum-cloud/cloud-portal).

## Identity

- **`serviceName`** — `assistant.miloapis.com`
- **`producerProjectRef.name`** — `cloud-portal`
- **`phase`** — `Draft`

A canonical `Service` registration lives in
`config/samples/services_v1alpha1_service_assistant.yaml`.

## What gets metered

The assistant bills along the same axes the underlying model provider
charges on. Splitting cache reads and writes from fresh input is
deliberate: every provider that offers prompt caching prices them
differently, and `MeterDefinition.measurement.aggregation` and
`measurement.unit` are immutable post-`Published`, so getting the split
right at `Draft` is materially cheaper than fixing it later.

| Meter name | Aggregation | Unit | Pricing unit | Notes |
| --- | --- | --- | --- | --- |
| `assistant.miloapis.com/conversation/input-tokens` | `Sum` | `{token}` | `k{token}` | Fresh input tokens. Excludes cache reads. |
| `assistant.miloapis.com/conversation/output-tokens` | `Sum` | `{token}` | `k{token}` | Includes any tokens emitted by extended thinking. |
| `assistant.miloapis.com/conversation/cache-read-tokens` | `Sum` | `{token}` | `k{token}` | Tokens served from the model provider's prompt cache. |
| `assistant.miloapis.com/conversation/cache-write-tokens` | `Sum` | `{token}` | `k{token}` | One-time cost of populating a cached prefix. |
| `assistant.miloapis.com/conversation/messages` | `Count` | `{message}` | `{message}` | Completed request/response cycles. Tier-cap framing and a billing safety-net when token totals are unavailable. |

Each meter declares two pricing-axis dimensions:

- **`model`** (required) — the provider model id (e.g. `claude-sonnet-4-6`). Required so per-model unit economics remain visible all the way to the bill.
- **`region`** (optional) — Datum deployment region serving the request. Useful when the portal runs in multiple regions or egress charges differ per region.

The concrete `MeterDefinition` CRs (`billing.miloapis.com/v1alpha1`)
ship in `datum-cloud/billing` under
`config/samples/billing_v1alpha1_meterdefinition_assistant_*.yaml`.
Once the services-operator's downstream-push controller is wired up
they will be authored as `services.miloapis.com/v1alpha1.MeterDefinition`
in this repo and pushed into billing automatically; until then both
sides are kept in sync manually.

## Monitored resource type

A single `MonitoredResourceType` binds the meters above to the
Kubernetes Kind that emits events:

- **`resourceTypeName`** — `assistant.miloapis.com/Conversation`
- **`gvk.group` / `gvk.kind`** — `assistant.miloapis.com` / `Conversation`
- **Closed label set** — `model` (required), `region` (optional)

A `Conversation` is created per top-level chat session and emits one
usage event per completed model response.

## Producer responsibilities

The cloud portal is the producer of usage events for this service. It
owns:

1. Generating an `eventID` (ULID) once per logical sample and reusing
   it on retry.
2. Attaching `projectRef` correctly so the durable usage pipeline can
   attribute the event to a `BillingAccountBinding`.
3. Honoring the `model` and (optional) `region` label set declared by
   the `MonitoredResourceType` — events with unknown labels are
   rejected at the gateway.
4. Keeping `meterName` and resource group/Kind in sync with this page;
   they are immutable on the catalog side.

The current emitter implementation lives in
[`cloud-portal/app/modules/usage`](https://github.com/datum-cloud/cloud-portal/tree/main/app/modules/usage).

## References

- [`docs/enhancements/service-registry.md`](../enhancements/service-registry.md)
- [`docs/enhancements/metering-definitions.md`](../enhancements/metering-definitions.md)
- [`docs/enhancements/monitored-resource-types.md`](../enhancements/monitored-resource-types.md)
- [`billing/docs/enhancements/usage-pipeline.md`](https://github.com/datum-cloud/billing/blob/docs/usage-pipeline/docs/enhancements/usage-pipeline.md)
