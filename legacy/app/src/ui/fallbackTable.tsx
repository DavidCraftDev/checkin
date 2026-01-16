export default function fallbackTable(props: { text: string }) {
    const { text } = props;
    return (
        <div className="table">
            <p className="text-center font-bold">{text}</p>
        </div>
    )
}