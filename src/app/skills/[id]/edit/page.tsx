"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { use } from "react";
import { SkillForm } from "../../new/page";

export default function SkillEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Skill Library"
        title="Edit your skill."
        body="Update your skill information, proficiency level, description, or exchange format."
      />
      <SkillForm editId={id} />
    </PageContainer>
  );
}
