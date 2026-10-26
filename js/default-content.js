// Default site content. Used by the dashboard's "Load default content" button
// to seed Firestore with the current copy so nothing has to be retyped.
window.QUBIT_DEFAULT_CONTENT = {
  site: {
    heroTitleBefore: "Quantum Computing, ",
    heroTitleHighlight: "Quantum Security",
    heroTitleAfter: " & Advanced Cybersecurity",
    heroSubtitle:
      "Engineering quantum-safe architectures for cloud, networks, hardware, and mission-critical systems.",
    servicesSubtitle:
      "Ten end-to-end capabilities that protect today's systems while preparing your organization for tomorrow's threats.",
    footerDescription:
      "Securing the quantum future with advanced cybersecurity and quantum-native security solutions.",
    contactEmail: "hello@qubit.io",
    contactPhone: "+1 (555) 012-3456",
    contactAddress: "1 Quantum Park, Innovation District"
  },

  services: [
    {
      id: "service-01",
      order: 1,
      icon: "quantum",
      active: true,
      title: "Quantum Computing Consulting",
      description: "Evaluate quantum use cases and build proof-of-concepts that deliver measurable business value.",
      bullets: ["Readiness assessments and roadmaps", "Quantum algorithm design", "Hybrid quantum-classical pilots"]
    },
    {
      id: "service-02",
      order: 2,
      icon: "pqc",
      active: true,
      title: "Post-Quantum Cryptography (PQC)",
      description: "Prepare for the quantum threat with NIST-aligned algorithms and controlled migration.",
      bullets: ["Cryptographic inventory and discovery", "PQC algorithm migration", "Crypto-agility architecture"]
    },
    {
      id: "service-03",
      order: 3,
      icon: "cloud",
      active: true,
      title: "Quantum-Safe Cloud Security",
      description: "Protect multi-cloud workloads against harvest-now-decrypt-later attacks.",
      bullets: ["Cloud encryption modernization", "Zero-trust access design", "Key management review"]
    },
    {
      id: "service-04",
      order: 4,
      icon: "qkd",
      active: true,
      title: "Quantum Key Distribution (QKD) Consulting",
      description: "Plan and deploy ultra-secure communication infrastructure using quantum key distribution.",
      bullets: ["QKD network design", "Secure communications architecture", "Resilience and monitoring"]
    },
    {
      id: "service-05",
      order: 5,
      icon: "hardware",
      active: true,
      title: "Hardware Security and Secure Chips",
      description: "Protect silicon, firmware, and the hardware supply chain from the ground up.",
      bullets: ["Secure boot and firmware review", "Hardware security modules", "Chip-level threat modeling"]
    },
    {
      id: "service-06",
      order: 6,
      icon: "software",
      active: true,
      title: "Software Security and Cryptographic Protocols",
      description: "Build resilient applications with audited protocols and secure implementation.",
      bullets: ["Protocol design and review", "Secure software development", "Key lifecycle management"]
    },
    {
      id: "service-07",
      order: 7,
      icon: "hybrid",
      active: true,
      title: "Hybrid Quantum-Classical Security",
      description: "Secure environments that combine classical systems with emerging quantum infrastructure.",
      bullets: ["Hybrid architecture assessment", "Migration and interoperability", "Risk controls across both layers"]
    },
    {
      id: "service-08",
      order: 8,
      icon: "ai",
      active: true,
      title: "AI-Powered Cybersecurity",
      description: "Detect and respond to threats faster with autonomous security operations.",
      bullets: ["Behavioral threat detection", "Automated incident response", "Model and data protection"]
    },
    {
      id: "service-09",
      order: 9,
      icon: "enterprise",
      active: true,
      title: "Enterprise and Government Security Solutions",
      description: "Meet demanding compliance and assurance needs for large, regulated organizations.",
      bullets: ["Governance and compliance alignment", "Sovereignty and data residency", "Mission-critical resilience"]
    },
    {
      id: "service-10",
      order: 10,
      icon: "research",
      active: true,
      title: "Quantum Technology Research and Development",
      description: "Advance applied quantum research with security built in from the start.",
      bullets: ["Applied research partnerships", "Prototype development", "Security evaluation and testing"]
    }
  ]
};
