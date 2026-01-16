// 🎭 The fallback table - AKA the "oops, nothing to see here" component! 😅
// 💡 When life gives you no data, make a fallback table! 🍋
export default function fallbackTable(props: { text: string }) {
    const { text } = props; // 📝 Extracting that sweet, sweet text prop! 
    return (
        // 📊 Behold! The mighty table that shows... well... nothing! But it looks good doing it! 💅
        <div className="table">
            <p className="text-center font-bold">{text}</p> {/* 🎯 CENTER STAGE, BABY! Bold and beautiful! ✨ */}
        </div>
    )
}