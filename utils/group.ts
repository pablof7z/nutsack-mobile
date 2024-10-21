export function getGroupIdFromEvent(event: NDKEvent): string | undefined {
    let tag = "h";
    
    if (event.kind >= 39000 && event.kind <= 39005) tag = "d";

    return event.tagValue(tag);
}