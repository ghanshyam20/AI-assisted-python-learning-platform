type StudentGreetingProps = {
  firstName: string
}

export function StudentGreeting({ firstName }: StudentGreetingProps) {
  return (
    <section className={String.fromCharCode(115,116,117,100,101,110,116,45,103,114,101,101,116,105,110,103)}>
      <p>YOUR LEARNING SPACE</p>
      <h2>Welcome back, {firstName}!</h2>
      <p>Ready to continue learning Python?</p>
    </section>
  )
}


