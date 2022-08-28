import { Showcase } from "./Home";
import { Box, Text } from "@chakra-ui/react";

export default function NotFound() {
    return (
        <Box>
            <Text className="text-4xl border-t-2 border-white md:border-transparent mb-5 pt-5 md:pt-0">
                <b style={{ color: "#bdefff" }}>404 Error</b>. Kindly check the URL again.
            </Text>
            
            <Showcase />
        </Box>
    );
}