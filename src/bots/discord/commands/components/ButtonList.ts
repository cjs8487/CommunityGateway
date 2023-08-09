import InteractionButton, { ButtonHandlerFunction } from './InteractionButton';
import openInquiryButton from './OpenInquiryButton';

const buttons: InteractionButton[] = [openInquiryButton];

const buttonHandlers: Map<string, ButtonHandlerFunction> = new Map(
    buttons.map((button) => [button.id, button.run]),
);

export default buttonHandlers;
