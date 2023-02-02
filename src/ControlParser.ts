import { Ber, BerReader } from 'asn1';

import type { Control, ControlOptions } from './controls';
import { EntryChangeNotificationControl, PagedResultsControl, PersistentSearchControl, ServerSideSortingRequestControl } from './controls';

type ControlConstructor = new (options?: ControlOptions) => Control;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ControlParser {
  private static controlMap = new Map<string, ControlConstructor>();

  public static parse(reader: BerReader): Control | null {
    if (reader.readSequence() === null) {
      return null;
    }

    let type = '';
    let critical = false;
    let value: Buffer = Buffer.alloc(0);
    if (reader.length) {
      const end = reader.offset + reader.length;

      type = reader.readString();
      if (reader.offset < end) {
        if (reader.peek() === Ber.Boolean) {
          critical = reader.readBoolean();
        }
      }

      if (reader.offset < end) {
        value = reader.readString(Ber.OctetString, true);
      }
    }

    let control: Control;

    const cls = ControlParser.controlMap.get(type);
    if (cls) {
      control = new cls({ critical });
    } else {
      return null;
    }

    const controlReader = new BerReader(value);
    control.parse(controlReader);
    return control;
  }

  public static registerControl(type: string, control: ControlConstructor): void {
    ControlParser.controlMap.set(type, control);
  }
}

// Register the built-in controls
ControlParser.registerControl(EntryChangeNotificationControl.type, EntryChangeNotificationControl);
ControlParser.registerControl(PagedResultsControl.type, PagedResultsControl);
ControlParser.registerControl(PersistentSearchControl.type, PersistentSearchControl);
ControlParser.registerControl(ServerSideSortingRequestControl.type, ServerSideSortingRequestControl);
