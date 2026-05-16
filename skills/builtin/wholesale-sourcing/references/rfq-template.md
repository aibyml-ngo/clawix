# RFQ template

Drop-in template for a request-for-quotation email body. The `wholesale-sourcing` skill renders one of these per merchant for any row marked `tpa` (trade-price-on-application) or `specialist`.

Save under `/workspace/<project-slug>/sourcing/rfqs/<merchant>.md`.

---

```markdown
# RFQ — <Merchant or supplier name>

- Project ref: <project-slug>
- Required on site: <date>
- Currency: <GBP | USD | EUR>
- Delivery to: <postcode-area only — never the full address in a request>
- Account number (if known + user-approved): <account-ref>
- Contact: <user display name> <user trade-business name> <user phone> <user email>

Hello <Merchant rep first name, if known>,

Please quote on the following lines for the above project. We are looking for:

- Trade price per line
- Confirmed lead time per line
- Stock vs lead-time options where relevant
- Delivery quote to the postcode area
- Validity period of the quote

## Items

| # | SKU / Spec        | Description                  | Unit | Qty | Notes                                |
|---|-------------------|------------------------------|------|-----|--------------------------------------|
| 1 | <sku or spec>     | <plain English>              | <unit> | <n> | <finish, colour, model variant>  |
| 2 | ...               | ...                          | ...  | ... | ...                                  |

Many thanks,

<user display name>
<user trade-business name>
```

---

## Rules for this template

- Postcode area only (e.g. `SW1`, `M3`, `EH7`) — never a full address in an RFQ. Delivery destination can be the postcode area until the order is placed.
- Account number echoed **only** if the user has explicitly approved it for this RFQ. Default behaviour: leave the line blank.
- One merchant per RFQ. The buying-plan summary lists all open RFQs.
- The RFQ is a draft email body. The bundle never sends.
- Customer's name is **never** in the RFQ. The merchant doesn't need to know who the user's customer is; that's between the user and the customer.
- "Validity period" question is included because trade-counter quotes are typically valid 14–30 days; the user needs to know the window.
