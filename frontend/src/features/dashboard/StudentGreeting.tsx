type StudentGreetingProps = {
  firstName: string
}

export function StudentGreeting({ firstName }: StudentGreetingProps) {
  return (
    <section className="student-greeting">
      <p>YOUR LEARNING SPACE</p>
      <h2>Welcome back, {firstName}!</h2>
      <p>Ready to continue learning Python?</p>
    </section>
  )
}


