function Manafinder() {
  return <p>Depricated</p>;
}

export default Manafinder;

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/claim",
      permanent: false
    }
  };
}
