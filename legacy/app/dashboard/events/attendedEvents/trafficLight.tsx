export default function TrafficLight({ status }: { status: "GREEN" | "YELLOW" | "RED" }) {
    let colorClass = "";
    switch (status) {
        case "GREEN":
        colorClass = "bg-green-500";
        break;
        case "YELLOW":
        colorClass = "bg-yellow-500";
        break;
        case "RED":
        colorClass = "bg-red-500";
        break;
    }
    
    return (
        <div className={`w-4 h-4 rounded-full ${colorClass} inline-block`}></div>
    );
}