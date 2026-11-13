type LearningTipCardProps = {
  title: string;
  description: string;
  example: string;
};

export default function LearningTipCard({
  title,
  description,
  example,
}: LearningTipCardProps) {
  return (
    <article className="learning-tip-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <pre>
        <code>{example}</code>
      </pre>
    </article>
  );
}