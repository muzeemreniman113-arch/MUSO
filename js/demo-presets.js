/**
 * MUSO File Transfer - Industrial Demo Presets
 * Pre-packaged authentic industrial datasets for instant evaluation and demonstration
 * Zero-Knowledge demo payloads for Defense, Energy, Healthcare, and Finance
 */

window.MusoDemoPresets = [
  {
    id: 'aerospace',
    category: 'Aerospace & Defense',
    fileName: 'sat_telemetry_vector_mission_alpha.log',
    fileType: 'text/plain',
    badge: 'DEFENSE LEVEL',
    description: 'Orbital satellite trajectory parameters, ion propulsion status, and encrypted telemetry stream.',
    recommendedPassphrase: 'Aero-Titan#9921!QuantumShield',
    content: `================================================================================
MUSO DEFENSE TELEMETRY LOG - ORBITAL ASSET SAT-908
CLASSIFICATION: RESTRICTED / ITAR COMPLIANT
SYSTEM: DEEP SPACE TELEMETRY LINK #4A
TIMESTAMP: 2026-10-26T04:12:08.914Z
================================================================================
[00:00:01.002] GYRO_STATUS: NOMINAL (DRIFT_RATE: <0.00003 deg/hr)
[00:00:01.140] ORBITAL_STATE_VECTOR:
               X: +6891240.21 m | VX: -1102.43 m/s
               Y: -2198402.12 m | VY: +7410.92 m/s
               Z: +0041289.44 m | VZ: +0342.11 m/s
[00:00:02.045] CRYPTO_ROTATION: EPHEMERAL AES-GCM-256 SESSION INITIATED
[00:00:02.120] PROPULSION_TELEMETRY: XENON_RESERVE: 84.6% | CHAMBER_PRESSURE: 21.4 bar
[00:00:03.491] THERMAL_CONTROL_LOOP: CORE_TEMP: 19.4 C | RADIATOR_PANEL_B: -41.2 C
[00:00:04.990] AUTONOMOUS_STATION_KEEPING: ENGAGED
================================================================================
ENGINEER CREDITS: Srivatsa Soham, Reniman Muzeem, Pullayya, Modi
VERIFICATION HASH: ALL CHANNELS ENCRYPTED VIA MUSO ZERO-KNOWLEDGE PROTOCOL
================================================================================`
  },
  {
    id: 'healthcare',
    category: 'Healthcare & Genomics',
    fileName: 'patient_genomic_sequencing_hipaa.json',
    fileType: 'application/json',
    badge: 'HIPAA & GDPR ART-32',
    description: 'High-security synthetic patient whole-exome sequencing report and clinical biomarker assay.',
    recommendedPassphrase: 'Helix*MedVault#2026!Secured',
    content: JSON.stringify({
      hipaaComplianceNotice: "This record is encrypted client-side using MUSO AES-256-GCM zero-knowledge protocol.",
      studyIdentifier: "GENOME-CLINICAL-TRIAL-V84",
      subjectId: "PT-SYNTH-849102",
      collectionTimestamp: "2026-10-26T03:45:00Z",
      specimen: {
        type: "Whole Blood PBMC",
        sequencingPlatform: "Illumina NovaSeq X Plus",
        coverageDepth: "60x Mean Target Depth"
      },
      actionableBiomarkers: [
        { gene: "BRCA1", variant: "c.5266dupC", classification: "Pathogenic", zygosity: "Heterozygous" },
        { gene: "TP53", variant: "c.743G>A", classification: "Likely Benign", zygosity: "Homozygous Wildtype" }
      ],
      cryptographicSignature: {
        algorithm: "ECDSA-P256-SHA256",
        signer: "MUSO Medical Security Framework",
        engineers: ["Srivatsa Soham", "Reniman Muzeem", "Pullayya", "Modi"]
      }
    }, null, 2)
  },
  {
    id: 'energy',
    category: 'Energy & Smart Grid',
    fileName: 'substation_scada_protection_settings.xml',
    fileType: 'application/xml',
    badge: 'NERC CIP-007 CRITICAL',
    description: 'Substation protective relay logic, high-voltage bus protection thresholds, and IEC 61850 parameters.',
    recommendedPassphrase: 'GridPower$Shield*994!Substation',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<SubstationConfiguration xmlns="http://www.muso-security.org/scada/61850">
  <!-- MUSO Secure Industrial Transfer Framework -->
  <Header id="SUB-400KV-NORTH" version="2026.4" timestamp="2026-10-26T04:00:00Z"/>
  <ProtectionRelay deviceType="SEL-411L" role="DifferentialLineProtection">
    <PickupThresholdUnit amperes="1200"/>
    <TripDelayCycles>1.5</TripDelayCycles>
    <ModbusTCPSecurity enabled="true" cipher="AES-256-GCM" zeroKnowledge="true"/>
    <CircuitBreakerTrips totalOperations="14" targetInterruptCapacityKA="63"/>
  </ProtectionRelay>
  <AuditVerification>
    <Project>MUSO File Transfer</Project>
    <Engineers>Srivatsa Soham, Reniman Muzeem, Pullayya, Modi</Engineers>
    <Standard>IEC 62351 Cyber Security for Power Grid</Standard>
  </AuditVerification>
</SubstationConfiguration>`
  },
  {
    id: 'finance',
    category: 'Executive Finance',
    fileName: 'merger_acquisition_escrow_audit.txt',
    fileType: 'text/plain',
    badge: 'SOX & FINRA COMPLIANT',
    description: 'Multi-billion dollar corporate merger valuation, escrow disbursement, and board clearance.',
    recommendedPassphrase: 'Titan*Acquisition$2026#Vault',
    content: `CONFIDENTIAL EXECUTIVE ACQUISITION REPORT - PROJECT TITAN
PREPARED FOR: BOARD OF DIRECTORS
TRANSFER METHOD: MUSO SECURE CLIENT-SIDE ENCRYPTED CHANNEL
DATE: OCTOBER 26, 2026

1. TRANSACTION OVERVIEW:
   - Target Entity: Synthetix Neural Systems Ltd.
   - Aggregate Consideration: USD $4,250,000,000
   - Escrow Retained: USD $425,000,000 (10% standard 18-month indemnity)

2. REGULATORY CLEARANCE STATUS:
   - DOJ Antitrust Division: Cleared
   - FTC Bureau of Competition: Unconditional Approval
   - CFIUS National Security Review: Safe Harbor Notice Issued

3. AUDIT TRAILS & CRYPTOGRAPHIC COMPLIANCE:
   - Key Escrow: Strictly Zero-Knowledge (Decentralized client-side derivation)
   - Cryptographic Protocol: MUSO AES-256-GCM NIST SP 800-38D
   - Architecture Team: Srivatsa Soham, Reniman Muzeem, Pullayya, Modi
================================================================================`
  }
];
